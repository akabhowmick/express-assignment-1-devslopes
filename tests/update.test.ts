import { beforeEach, describe, expect, it } from "vitest";
import { clearDb } from "../prisma/clearDb";
import { Dog } from "@prisma/client";
import { seedDogs } from "../prisma/seedDogs";
import { AxiosInstance } from "./helper";
import { prisma } from "../prisma/prisma-instance";

const { patch } = AxiosInstance;

describe("POST /dogs", () => {
  let doomslayer: Dog;

  beforeEach(async () => {
    await clearDb();
    const data = await seedDogs();
    doomslayer = data.dogs.doomslayer;
  });

  it("Endpoint should exist", async () => {
    const { status } = await patch(
      `/dogs/${doomslayer.id}`
    );
    expect(status).not.toBe(404);
  });

  it("Should allow me to update name", async () => {
    const newName = "Doom Slayer";
    const { status, data } = await patch(
      `/dogs/${doomslayer.id}`,
      {
        name: newName,
      }
    );
    expect(status).toBe(201);
    expect(data.name).toBe(newName);
    const newDoomslayer = await prisma.dog.findFirst({
      where: {
        id: doomslayer.id,
      },
    });
    expect(newDoomslayer?.name).toBe(newName);
  });
  it("Should allow me to update description", async () => {
    const newDescription = "he is a dog";
    const { status, data } = await patch(
      `/dogs/${doomslayer.id}`,
      {
        description: newDescription,
      }
    );
    expect(status).toBe(201);
    expect(data.description).toBe(newDescription);
    const newDoomslayer = await prisma.dog.findFirst({
      where: {
        id: doomslayer.id,
      },
    });
    expect(newDoomslayer?.description).toBe(newDescription);
  });

  it("Should allow me to update breed", async () => {
    const newBreed = "Cheese Dog";
    const { status, data } = await patch(
      `/dogs/${doomslayer.id}`,
      {
        breed: newBreed,
      }
    );
    expect(status).toBe(201);
    expect(data.breed).toBe(newBreed);
    const newDoomslayer = await prisma.dog.findFirst({
      where: {
        id: doomslayer.id,
      },
    });
    expect(newDoomslayer?.breed).toBe(newBreed);
  });

  it("Should allow me to update age", async () => {
    const newAge = 45;
    const { status, data } = await patch(
      `/dogs/${doomslayer.id}`,
      {
        age: newAge,
      }
    );
    expect(status).toBe(201);
    expect(data.age).toBe(newAge);
    const newDoomslayer = await prisma.dog.findFirst({
      where: {
        id: doomslayer.id,
      },
    });
    expect(newDoomslayer?.age).toBe(newAge);
  });

  it("Should reject invalid keys", async () => {
    const updateData = {
      cheese: "yes please",
      id: "123",
    };
    const { data } = await patch(
      `/dogs/${doomslayer.id}`,
      updateData
    );

    for (const key of ["id", "cheese"]) {
      console.log(data.errors);
      expect(data.errors).toContain(
        `'${key}' is not a valid key`
      );
    }
  });
});
