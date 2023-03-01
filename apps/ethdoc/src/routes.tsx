import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  RouteProps,
} from "react-router-dom";

import { ErrorView, HomeView } from "./views";

interface Props extends RouteProps {
  component: any; // TODO: new (props: any) => React.Component
  from: string;
}

const CustomRoute = ({ component: Component, ...rest }: Props) => {
  return (
    <Route {...rest} render={(matchProps) => <Component {...matchProps} />} />
  );
};

export const Routes = () => (
  <Router>
    <Switch>
      <CustomRoute exact path="/" component={HomeView} from="/" />
      <Route path="/error">
        <ErrorView />
      </Route>
    </Switch>
  </Router>
);
