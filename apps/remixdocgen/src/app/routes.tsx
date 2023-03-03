import React from "react";
import {
  BrowserRouter as Router,
  Route,
  RouteProps,
} from "react-router-dom";



interface Props extends RouteProps {
  component: any; // TODO: new (props: any) => React.Component
  from: string;
}

const CustomRoute = ({ component: Component, ...rest }: Props) => {
  return (
    <></>
  );
};

export const Routes = () => (
  <Router>
  </Router>
);
