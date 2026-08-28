import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, inquiriesTable, soldVehiclesTable, vehiclesTable } from "@workspace/db";
import {
  CreateInquiryBody,
  GetInventoryVehicleParams,
  GetInventoryVehicleResponse,
  GetSiteSummaryResponse,
  ListInventoryQueryParams,
  ListInventoryResponse,
  ListInventoryResponseItem,
  ListServicesResponse,
  ListServicesResponseItem,
  ListSoldVehiclesQueryParams,
  ListSoldVehiclesResponse,
  ListSoldVehiclesResponseItem,
  CreateInquiryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const services = [
  {
    id: 1,
    name: "Búsqueda y revisión",
    description: "Encontramos el auto correcto y verificamos su historia antes de moverlo.",
    details: ["Búsqueda en Estados Unidos y Europa", "Revisión de condición y título", "Recorrido en fotos y video"],
  },
  {
    id: 2,
    name: "Traslado seguro en México",
    description: "Coordinamos la recolección, el traslado y la entrega de tu auto dentro de México.",
    details: ["Grúa y transporte nacional", "Entrega en cualquier estado de México", "Actualizaciones durante el traslado"],
  },
  {
    id: 3,
    name: "Importación y legalización",
    description: "Te acompañamos con documentos, aduana y registro para que el auto llegue listo para México.",
    details: ["Preparación de documentos", "Coordinación con agente aduanal", "Orientación para legalización y registro"],
  },
  {
    id: 4,
    name: "Entrega en cualquier estado de México",
    description: "Cuando el auto está listo, coordinamos su traslado hasta la ciudad y dirección que indiques.",
    details: ["Salida desde aduana o punto de resguardo", "Ruta y tiempo estimado de entrega", "Seguimiento hasta confirmar la recepción"],
  },
];

router.get("/inventory", async (req, res): Promise<void> => {
  const parsed = ListInventoryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, bodyStyle, sort } = parsed.data;
  const filters = [];
  if (search) {
    filters.push(
      or(
        ilike(vehiclesTable.make, `%${search}%`),
        ilike(vehiclesTable.model, `%${search}%`),
        ilike(vehiclesTable.location, `%${search}%`),
      ),
    );
  }
  if (bodyStyle) {
    filters.push(eq(vehiclesTable.bodyStyle, bodyStyle));
  }

  const orderBy =
    sort === "price-low"
      ? asc(vehiclesTable.price)
      : sort === "price-high"
        ? desc(vehiclesTable.price)
        : desc(vehiclesTable.featured);

  const vehicles = await db
    .select()
    .from(vehiclesTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(orderBy, desc(vehiclesTable.id));

  res.json(ListInventoryResponse.parse(vehicles));
});

router.get("/inventory/:slug", async (req, res): Promise<void> => {
  const parsed = GetInventoryVehicleParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.slug, parsed.data.slug));

  if (!vehicle) {
    res.status(404).json({ error: "Auto no encontrado" });
    return;
  }

  res.json(GetInventoryVehicleResponse.parse(vehicle));
});

router.get("/sold", async (req, res): Promise<void> => {
  const parsed = ListSoldVehiclesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search } = parsed.data;
  const vehicles = await db
    .select()
    .from(soldVehiclesTable)
    .where(
      search
        ? or(
            ilike(soldVehiclesTable.make, `%${search}%`),
            ilike(soldVehiclesTable.model, `%${search}%`),
          )
        : undefined,
    )
    .orderBy(desc(soldVehiclesTable.soldDate), desc(soldVehiclesTable.id));

  res.json(ListSoldVehiclesResponse.parse(vehicles));
});

router.get("/services", async (_req, res): Promise<void> => {
  res.json(ListServicesResponse.parse(services));
});

router.get("/site-summary", async (_req, res): Promise<void> => {
  const [available, sold] = await Promise.all([
    db.select({ id: vehiclesTable.id }).from(vehiclesTable),
    db.select({ id: soldVehiclesTable.id }).from(soldVehiclesTable),
  ]);

  res.json(
    GetSiteSummaryResponse.parse({
      availableCount: available.length,
      soldCount: sold.length,
      yearsExperience: 12,
      statesCovered: 32,
    }),
  );
});

router.post("/inquiries", async (req, res): Promise<void> => {
  const parsed = CreateInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.data.email)) {
    res.status(400).json({ error: "Escribe un correo electrónico válido" });
    return;
  }

  const [inquiry] = await db
    .insert(inquiriesTable)
    .values({
      ...parsed.data,
      phone: parsed.data.phone ?? null,
      vehicleSlug: parsed.data.vehicleSlug ?? null,
    })
    .returning();

  res.status(201).json(
    CreateInquiryResponse.parse({
      ...inquiry,
      createdAt: inquiry.createdAt.toISOString(),
    }),
  );
});

export default router;