import { observer } from "mobx-react-lite";
import { FC } from "react";
import { Card, CardHeader, CardTitle } from "./card";

interface Props {
  name: string;
}

export const ChartCard: FC<Props> = observer((x) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{x.name}</CardTitle>
      </CardHeader>
    </Card>
  );
});
