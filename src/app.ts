import express from "express";
import { z } from "zod";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import { validateRequest } from "zod-express-middleware";
import "express-async-errors";

const app = express();
app.use(express.json());
// All code should go below this line

app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(200); // the 'status' is unnecessary but wanted to show you how to define a status
});

//Get (/dogs)
app.get("/dogs", async (req, res) => {
  const dogs = await prisma.dog.findMany();
  res.status(200).send(dogs);
});

const dogSchema = z.object({
  name: z.string(),
  age: z.number(),
  breed: z.string(),
  description: z.string(),
});

// Get (/dogs/:id)
app.get("/dogs/:id", async (req, res) => {
  // checking if the id is a number
  if (typeof req.params.id !== "number") {
    return res
      .status(400)
      .send({ message: "id should be a number" });
  }
  const id = +req.params.id;
  const dog = await prisma.dog
    .findUnique({
      where: {
        id,
      },
    })
    .catch(() => "server-error");
  // checking if there is a server error other than the id not being a number
  if (dog === "server-error") {
    return res
      .status(400)
      .send({ message: "server-error" });
  }
  // checking if the dog exists
  if (!dog) {
    return res.status(204).send({ error: "Nothing found" });
  }
  return res.status(200).send(dog);
});

//Post (/dogs)
app.post(
  "/dogs",
  validateRequest({
    body: dogSchema.strict(),
  }),
  async (req, res) => {
    // used zod here for better error handling

    try {
      const newDog = await prisma.dog.create({
        data: {
          ...req.body,
        },
      });
      res.status(201).send(newDog);
    } catch (error) {
      console.log(error);
      res.status(400).send({ error: "Server Side Error" });
    }
  }
);
// bad keys and multiple errors on just breed

// Patch (/dogs/:id)
app.patch(
  "/dogs/:id",
  validateRequest({
    body: dogSchema.strict().partial(),
  }),
  async (req, res) => {
    const id = +req.params.id;
    const dog = await prisma.dog.findUnique({
      where: {
        id,
      },
    });
    if (!dog) {
      return res
        .status(204)
        .send({ error: "Nothing found" });
    }
    const updateDog = await prisma.dog.update({
      where: {
        id,
      },
      data: {
        ...dog,
        ...req.body,
      },
    });
    return res.status(201).send(updateDog);
  }
);

// DELETE (/dogs/:id)
app.delete("/dogs/:id", async (req, res) => {
  if (isNaN(parseInt(req.params.id, 10))) {
    return res
      .status(400)
      .send({ message: "id should be a number" });
  }
  const id = +req.params.id;
  const deletedDog = await prisma.dog
    .delete({
      where: {
        id,
      },
    })
    .catch(() => null);
  if (!deletedDog) {
    return res.status(204).send({ error: "Nothing found" });
  }
  return res.status(200).send(`Dog deleted with id: ${id}`);
});

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);

// prev code for post
// const name = req.body?.name;
// const breed = req.body?.breed;
// const description = req.body?.description;
// const age = req.body?.age;
// if (typeof age !== "number") {
//   return res.status(400).send({ error: "age should be a number" });
// }
// if (typeof name !== "string") {
//   return res.status(400).send({ error: "name should be a string" });
// }
// if (typeof description !== "string") {
//   return res.status(400).send({ error: "description should be a string" });
// }
