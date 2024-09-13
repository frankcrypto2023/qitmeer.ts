// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

import OPS from "./ops";

const map: Record<number, string> = {};
for (const op in OPS) {
  const code = OPS[op] as number;
  map[code] = op;
}

export { map };
