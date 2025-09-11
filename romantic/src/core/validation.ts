function verifyAll(...checks: boolean[]) {
  let pass = 0

  for (let i = 0; i < checks.length; i++) {
    if (!checks[i]) {
      pass += (1 << i);
    }
  }

  return pass;
}

function check(flags: number, index: number) {
  return !((flags & (1 << index)) === 0);
}

function lengthCheck(value: string, min?: number, max?: number) {
  if (!value) return false;
  const len = value.length;

  if (min && value.length < len) return false;
  if (max && value.length > max) return false;

  return true;
}

function rangeCheck(value: number, min?: number, max?: number) {
  if (!value) return false;

  if (max && value > max) return false;
  if (min && value < min) return false;

  return true;
}

function regexCheck(value: string, exp: RegExp) {
  if (!value) return false;

  return exp.test(value);
}

export {
  verifyAll, check,
  lengthCheck,
  rangeCheck,
  regexCheck,
}
