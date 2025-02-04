import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";

const responseSchema = z.object({
  message: z.string(),
});

const testRouter = new Hono().get(
  "/hello",
  describeRoute({
    description: "Say hello to the user",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "text/plain": { schema: resolver(responseSchema) },
        },
      },
    },
  }),
  zValidator(
    "query",
    z.object({
      name: z.string(),
    }),
  ),
  (c) => {
    const { name } = c.req.valid("query");
    return c.json({
      message: `Hello! ${name} from test`,
    });
  },
);

export { testRouter };
