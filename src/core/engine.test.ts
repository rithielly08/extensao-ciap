import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createEngine, dictionary, engine, normalize } from "./index";

const codes = (text: string) => engine.suggest(text).map((s) => s.code);

describe("dicionário", () => {
  it("tem 48 códigos únicos, no formato CIAP-2", () => {
    assert.equal(dictionary.length, 48);
    const unique = new Set(dictionary.map((e) => e.code));
    assert.equal(unique.size, dictionary.length);
    for (const entry of dictionary) {
      assert.match(entry.code, /^[A-Z]\d{2}$/, entry.code);
      assert.ok(entry.label.trim(), `${entry.code} sem rótulo`);
      assert.ok(entry.terms.length > 0, `${entry.code} sem termos`);
    }
  });
});

describe("normalize", () => {
  it("remove acentos, caixa e espaços extras", () => {
    assert.equal(normalize("  Dor  de CABEÇA "), "dor de cabeca");
    assert.equal(normalize(null), "");
  });
});

describe("suggest", () => {
  it("reconhece termos coloquiais", () => {
    assert.ok(codes("Paciente com dor de cabeça").includes("N01"));
  });

  it("reconhece vários sintomas na mesma frase", () => {
    const found = codes("Paciente relata tosse, febre e dor lombar");
    for (const code of ["R05", "A03", "L03"]) assert.ok(found.includes(code), code);
  });

  it("ignora termos negados", () => {
    assert.ok(!codes("nega febre").includes("A03"));
    assert.ok(!codes("sem tosse").includes("R05"));
  });

  it("ignora hipóteses", () => {
    assert.ok(!codes("suspeita de febre").includes("A03"));
  });

  it("a negação não vaza para a frase seguinte", () => {
    assert.ok(codes("Nega febre. Refere tosse.").includes("R05"));
  });

  it("reconhece expressões com acento e sem acento", () => {
    assert.ok(codes("ardor ao urinar").includes("U01"));
    assert.ok(codes("INSONIA").includes("P06"));
  });

  it("não casa no meio de outra palavra", () => {
    assert.deepEqual(codes("febrezinha"), []);
  });

  it("agrupa os termos encontrados por código", () => {
    const [s] = engine.suggest("cefaleia e dor de cabeça");
    assert.equal(s.code, "N01");
    assert.deepEqual(s.terms, ["cefaleia", "dor de cabeça"]);
  });

  it("devolve lista vazia para texto vazio", () => {
    assert.deepEqual(engine.suggest(""), []);
  });

  it("aceita um dicionário customizado", () => {
    const custom = createEngine([{ code: "X01", label: "Teste", terms: ["abc"] }]);
    assert.deepEqual(custom.suggest("tem abc").map((s) => s.code), ["X01"]);
  });
});
