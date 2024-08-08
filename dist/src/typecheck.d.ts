type TypeFunction = (value: any) => boolean;
declare function typecheck(type: TypeFunction, value: any): boolean;
export default typecheck;
