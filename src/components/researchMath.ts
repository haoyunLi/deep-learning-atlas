export type HierarchyRow = {
  donor: string;
  age: number;
  cell: number;
  train: boolean;
  prediction: number;
};

/** Deliberately pathological synthetic fingerprint memorizer, not a scientific model. */
export function hierarchySplit(cellsPerDonor: number, mode: "row" | "group") {
  const count = Math.max(2, Math.min(20, 2 * Math.round(cellsPerDonor / 2)));
  const donors = [
    { id: "A", age: 30 },
    { id: "B", age: 40 },
    { id: "C", age: 60 },
    { id: "D", age: 70 },
  ];
  const rows = donors.flatMap((donor, i) =>
    Array.from({ length: count }, (_, cell) => ({
      donor: donor.id,
      age: donor.age,
      cell,
      train: mode === "row" ? cell < count / 2 : i < 2,
    })),
  );
  const train = rows.filter((r) => r.train);
  const fallback = train.reduce((sum, r) => sum + r.age, 0) / train.length;
  const learned = new Map(train.map((r) => [r.donor, r.age]));
  const predictions: HierarchyRow[] = rows.map((r) => ({
    ...r,
    prediction: learned.get(r.donor) ?? fallback,
  }));
  const test = predictions.filter((r) => !r.train);
  const trainDonors = [...new Set(train.map((r) => r.donor))];
  const testDonors = [...new Set(test.map((r) => r.donor))];
  return {
    rows: predictions,
    trainRows: train.length,
    testRows: test.length,
    trainDonors,
    testDonors,
    overlap: testDonors.filter((d) => trainDonors.includes(d)),
    fallback,
    mae:
      test.reduce((sum, r) => sum + Math.abs(r.prediction - r.age), 0) /
      test.length,
  };
}
