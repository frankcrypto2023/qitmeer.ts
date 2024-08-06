// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

// 定义类型接口
type TypeFunction = (value: any) => boolean;

function _getTypeName(fn: TypeFunction): string | undefined | null {
  return (
    fn.name || fn.toString().match(/function (.*?)\s*\(/)?.[1] || "unknown"
  );
}

function typecheck(type: TypeFunction, value: any): boolean {
  if (type(value)) return true;
  const tname = _getTypeName(type);
  throw new Error("check type " + tname + " failed, invalid value " + value);
}

export default typecheck;
