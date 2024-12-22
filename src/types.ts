export type FieldInfo = {
  name: string;
  comment: string | null;
  definition: string;
};

export type StatementInfo = {
  type: string;
  name: string | null;
  comment: string;
  definition: string;
  fields: Array<FieldInfo> | null;
};
