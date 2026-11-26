export type CepAddress = {
  street: string;
  district: string;
  city: string;
  state: string;
};

// Consulta ao ViaCEP feita no servidor (o CSP só permite connect-src 'self').
// Só aceita 8 dígitos, então a URL externa não é controlável por quem chama.
// Qualquer falha devolve null: o cliente preenche à mão e a compra segue.
export async function lookupCep(zip: string): Promise<CepAddress | null> {
  const digits = zip.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      erro?: boolean | string;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
    };
    if (data.erro || !data.localidade || !data.uf) return null;
    // CEP único de cidade pequena vem sem logradouro e bairro.
    return {
      street: data.logradouro ?? "",
      district: data.bairro ?? "",
      city: data.localidade,
      state: data.uf,
    };
  } catch {
    return null;
  }
}
