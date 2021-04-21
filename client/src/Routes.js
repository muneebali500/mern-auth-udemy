import { BrowserRouter, Switch, Route } from "react-router-dom";
import App from "./App";
import Signup from "./auth/Signup";
import Signin from "./auth/Signin";
import Activate from "./auth/Activate";

export default function Routes() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={App}></Route>
        <Route path="/signup" exact component={Signup}></Route>
        <Route path="/signin" exact component={Signin}></Route>
        <Route path="/auth/activate/:token" exact component={Activate}></Route>
      </Switch>
    </BrowserRouter>
  );
}
