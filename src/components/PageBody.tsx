import { ReactNode } from "react";

interface Props {
  children: ReactNode
}

export default function PageBody({ children }: Props) {
  return <p className="page-body" >{ children }</p>
}
