import express from "express";
// import { z } from "zod";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
// import { validateRequest } from "zod-express-middleware";
import "express-async-errors";

const app = express();
app.use(express.json());
// All code should go below this line
const validKeys = ["name", "age", "breed", "description"];

app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(200); // the 'status' is unnecessary but wanted to show you how to define a status
});

//Get (/dogs)
app.get("/dogs", async (req, res) => {
  const dogs = await prisma.dog.findMany();
  res.status(200).send(dogs);
});

// const dogSchema = z.object({
//   name: z.string(),
//   age: z.number(),
//   breed: z.string(),
//   description: z.string(),
// });

// Get (/dogs/:id)
app.get("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  const dog = await prisma.dog
    .findUnique({
      where: {
        id,
      },
    })
    .catch(() => "server-error");
  if (dog === "server-error") {
    return res
      .status(400)
      .send({ message: "id should be a number" });
  }
  // checking if the dog exists
  if (!dog) {
    return res.status(204).send({ error: "Nothing found" });
  }
  return res.status(200).send(dog);
});

//Post (/dogs)
app.post("/dogs", async (req, res) => {
  const name = req.body?.name;
  const breed = req.body?.breed;
  const description = req.body?.description;
  const age = req.body?.age;
  const errors: string[] = [];
  if (typeof age !== "number") {
    errors.push("age should be a number");
  }
  if (typeof name !== "string") {
    errors.push("name should be a string");
  }
  if (typeof description !== "string") {
    errors.push("description should be a string");
  }

  // validating the request body
  const sentKeys = Object.keys(req.body);
  sentKeys.forEach((key: string) => {
    if (!validKeys.includes(key)) {
      errors.push(`'${key}' is not a valid key`);
    }
  });

  if (errors.length) {
    return res.status(400).send({ errors: errors });
  }

  try {
    const newDog = await prisma.dog.create({
      data: {
        name,
        breed,
        description,
        age,
      },
    });
    res.status(201).send(newDog);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Server Side Error" });
  }
});
// bad keys and multiple errors on just breed

// Patch (/dogs/:id)
app.patch("/dogs/:id", async (req, res) => {
  // finding the dog
  const id = +req.params.id;
  const dog = await prisma.dog.findUnique({
    where: {
      id,
    },
  });
  if (!dog) {
    return res.status(204).send({ error: "Nothing found" });
  }

  // validating the request body
  const sentKeys = Object.keys(req.body);
  const errors: string[] = [];
  let validBody = true;
  sentKeys.forEach((key: string) => {
    if (!validKeys.includes(key)) {
      validBody = false;
      errors.push(`'${key}' is not a valid key`);
    }
  });

  // applying the changes to the dog if found and valid
  if (validBody) {
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
  } else {
    return res.status(400).send({ errors: errors });
  }
});

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
  return res.status(200).send(deletedDog);
});

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
