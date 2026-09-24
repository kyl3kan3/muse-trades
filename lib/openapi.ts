export function spec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "Muse Trades Connector",
      version: "0.1.0",
      description:
        "Quote, hold a slot, collect a deposit, and book HVAC or plumbing jobs in the St. Louis metro. Built for Meta Muse agents.",
    },
    servers: [{ url: "/", description: "This host" }],
    paths: {
      "/api/v1/shops": {
        get: {
          summary: "List shops an agent can book",
          parameters: [
            { name: "trade", in: "query", schema: { enum: ["hvac", "plumbing"] } },
            { name: "city", in: "query", schema: { type: "string" } },
          ],
        },
      },
      "/api/v1/quote": {
        post: {
          summary: "Return a price range in under two seconds",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/QuoteRequest" },
              },
            },
          },
        },
      },
      "/api/v1/availability": {
        get: {
          summary: "Live 90-minute slots for a shop",
          parameters: [
            { name: "shopId", in: "query", required: true, schema: { type: "string" } },
            { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
          ],
        },
      },
      "/api/v1/holds": {
        post: {
          summary: "Soft-hold a slot for 15 minutes",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["shopId", "slotStart"],
                  properties: {
                    shopId: { type: "string" },
                    quoteId: { type: "string" },
                    slotStart: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/bookings": {
        post: {
          summary: "Convert a hold into a booking and return a deposit link",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BookingRequest" },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        QuoteRequest: {
          type: "object",
          required: ["serviceType"],
          properties: {
            shopId: { type: "string" },
            trade: { enum: ["hvac", "plumbing"] },
            serviceType: {
              enum: [
                "ac_replace",
                "ac_repair",
                "furnace_replace",
                "furnace_repair",
                "maintenance",
                "water_heater",
                "drain",
                "leak",
                "repipe",
                "other",
              ],
            },
            city: { type: "string" },
            zip: { type: "string" },
            squareFootage: { type: "integer" },
            tonnage: { type: "number" },
            unitYear: { type: "integer" },
            description: { type: "string" },
          },
        },
        BookingRequest: {
          type: "object",
          required: ["shopId", "customerName", "address"],
          properties: {
            shopId: { type: "string" },
            quoteId: { type: "string" },
            holdId: { type: "string" },
            slotStart: { type: "string" },
            slotEnd: { type: "string" },
            customerName: { type: "string" },
            customerPhone: { type: "string" },
            customerEmail: { type: "string" },
            address: { type: "string" },
          },
        },
      },
    },
  };
}
