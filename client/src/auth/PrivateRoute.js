import { Component } from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuth } from "./helpers";

export default function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuth() && isAuth().role === `subscriber` ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/signin",
              state: { from: props.location },
            }}
          />
        )
      }
    ></Route>
  );
}
