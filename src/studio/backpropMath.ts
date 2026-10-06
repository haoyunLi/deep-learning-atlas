export type TrainingInputs = {
  x: number;
  w: number;
  v: number;
  target: number;
  eta: number;
};
export const defaultTrainingInputs: TrainingInputs = {
  x: 2,
  w: 0.5,
  v: 1,
  target: 1,
  eta: 0.25,
};

export function forwardTraining(p: TrainingInputs) {
  const z = p.w * p.x;
  const h = Math.tanh(z);
  const prediction = p.v * h;
  const residual = prediction - p.target;
  return { z, h, prediction, residual, loss: 0.5 * residual ** 2 };
}

export function trainingStep(p: TrainingInputs) {
  if (Object.values(p).some((value) => !Number.isFinite(value)) || p.eta < 0)
    throw new RangeError(
      "Training inputs must be finite and learning rate nonnegative",
    );
  const before = forwardTraining(p);
  const outputGradient = before.residual;
  const hiddenGradient = outputGradient * p.v;
  const activationDerivative = 1 - before.h ** 2;
  const affineGradient = hiddenGradient * activationDerivative;
  const wGradient = affineGradient * p.x;
  const vGradient = outputGradient * before.h;
  // Both gradients come from the SAME old forward pass. Do not recompute
  // w's gradient after updating v: that would be a different algorithm.
  const updated = {
    ...p,
    w: p.w - p.eta * wGradient,
    v: p.v - p.eta * vGradient,
  };
  return {
    before,
    after: forwardTraining(updated),
    updated,
    outputGradient,
    hiddenGradient,
    activationDerivative,
    affineGradient,
    wGradient,
    vGradient,
  };
}

export function trainingNumber(value: number) {
  if (value === 0) return "0";
  return Math.abs(value) < 0.001 ? value.toExponential(2) : value.toFixed(4);
}

export function tanhProbe(z: number, delta: number) {
  if (!Number.isFinite(z) || !Number.isFinite(delta) || delta === 0)
    throw new RangeError(
      "Probe needs a finite point and nonzero finite change",
    );
  const h = Math.tanh(z);
  const slope = 1 - h ** 2;
  const nextH = Math.tanh(z + delta);
  return {
    h,
    slope,
    nextH,
    actualChange: nextH - h,
    linearChange: slope * delta,
    secant: (nextH - h) / delta,
  };
}

// Each point proposes ONE simultaneous update from the same old parameters.
// It is a slice along a frozen negative-gradient direction, not training history.
export function trainingLossSlice(p: TrainingInputs) {
  const r = trainingStep(p);
  const points = Array.from({ length: 81 }, (_, i) => {
    const eta = i / 40;
    return {
      eta,
      loss: forwardTraining({
        ...p,
        w: p.w - eta * r.wGradient,
        v: p.v - eta * r.vGradient,
      }).loss,
    };
  });
  return { points, initialSlope: -(r.wGradient ** 2 + r.vGradient ** 2) };
}
