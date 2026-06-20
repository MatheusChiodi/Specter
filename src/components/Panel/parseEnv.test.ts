import { describe, it, expect } from "vitest";
import { parseEnv } from "./parseEnv";

describe("parseEnv", () => {
  it("lê pares chave=valor", () => {
    expect(parseEnv("A=1\nB=2")).toEqual([
      ["A", "1"],
      ["B", "2"],
    ]);
  });

  it("ignora comentários e linhas vazias", () => {
    expect(parseEnv("# comentário\n\nKEY=val\n")).toEqual([["KEY", "val"]]);
  });

  it("remove aspas envolventes", () => {
    expect(parseEnv('A="com espaço"\nB=\'x\'')).toEqual([
      ["A", "com espaço"],
      ["B", "x"],
    ]);
  });

  it("ignora linhas sem '=' ou sem chave", () => {
    expect(parseEnv("inválida\n=semchave\nOK=1")).toEqual([["OK", "1"]]);
  });
});
