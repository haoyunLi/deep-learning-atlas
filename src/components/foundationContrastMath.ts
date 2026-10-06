export function xorContrast(nonlinear: boolean) {
  return [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ].map(([x1, x2]) => {
    const s = x1 + x2;
    const activation = (z: number) => (nonlinear ? Math.max(0, z) : z);
    const h1 = activation(s),
      h2 = activation(s - 1);
    const margin = h1 - 2 * h2 - 0.5;
    return {
      x1,
      x2,
      h1,
      h2,
      margin,
      target: x1 === x2 ? 0 : 1,
      prediction: margin > 0 ? 1 : 0,
    };
  });
}

export function classificationContrast(logits: readonly number[], target = 0) {
  if (
    !logits.length ||
    !logits.every(Number.isFinite) ||
    !Number.isInteger(target) ||
    target < 0 ||
    target >= logits.length
  )
    throw new Error("Invalid logits or target");
  const max = Math.max(...logits);
  const exponentials = logits.map((z) => Math.exp(z - max));
  const sum = exponentials.reduce((a, b) => a + b, 0);
  const probabilities = exponentials.map((e) => e / sum);
  const loss = max + Math.log(sum) - logits[target];
  const gradients = probabilities.map((p, i) => p - Number(i === target));
  return { probabilities, loss, gradients };
}

export function sharedParameterContrast(weight: number) {
  if (!Number.isFinite(weight)) throw new Error("Invalid weight");
  const z1 = 2 * weight,
    z2 = 3 * weight;
  const prediction = z1 + z2,
    residual = prediction - 4;
  return {
    z1,
    z2,
    prediction,
    residual,
    loss: 0.5 * residual ** 2,
    branch1: 2 * residual,
    branch2: 3 * residual,
    gradient: 5 * residual,
  };
}
