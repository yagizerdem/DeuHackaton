import type { Query } from "mongoose";

type QueryString = Record<string, unknown>;

const RESERVED_FIELDS = ["page", "sort", "limit", "skip", "fields"];
const OPERATORS = ["gte", "gt", "lte", "lt", "in", "ne"];
const BRACKET_KEY = new RegExp(`^(.+)\\[(${OPERATORS.join("|")})\\]$`);

export class ApiFetures<T = unknown> {
  constructor(
    public query: Query<T[], T>,
    private queryString: QueryString,
  ) {}

  limit(limit: number) {
    this.query = this.query.limit(limit);
    return this;
  }

  skip(skip: number) {
    this.query = this.query.skip(skip);
    return this;
  }

  // ?price[gte]=10&price[lt]=50&role[in]=a,b&active=true
  filter() {
    const filter: Record<string, unknown> = {};

    const setCondition = (field: string, operator: string, value: unknown) => {
      const current = filter[field];
      const conditions =
        typeof current === "object" && current !== null ? current : {};
      filter[field] = {
        ...conditions,
        [`$${operator}`]:
          operator === "in" && typeof value === "string"
            ? value.split(",")
            : value,
      };
    };

    for (const [key, value] of Object.entries(this.queryString)) {
      if (RESERVED_FIELDS.includes(key) || key.startsWith("$")) continue;

      const bracket = BRACKET_KEY.exec(key);
      if (bracket) {
        setCondition(bracket[1]!, bracket[2]!, value);
      } else if (typeof value === "object" && value !== null) {
        for (const [operator, operand] of Object.entries(value)) {
          if (OPERATORS.includes(operator)) setCondition(key, operator, operand);
        }
      } else {
        filter[key] = value;
      }
    }

    this.query = this.query.find(filter);
    return this;
  }

  // ?fields=name,price
  select() {
    const { fields } = this.queryString;
    this.query = this.query.select(
      typeof fields === "string" ? fields.split(",").join(" ") : "-__v",
    );
    return this;
  }
}
