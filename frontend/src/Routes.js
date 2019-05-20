import React from "react"
import { Switch } from "react-router-dom"
import Home from "./containers/Home"
import Login from "./containers/Login"
import NewEvent from "./containers/NewEvent"
import Event from "./containers/Event";
import AppliedRoute from "./components/AppliedRoute"

export default ({ childProps }) =>
    <Switch>
        <AppliedRoute path="/" exact component={Home} props={childProps} />
        <AppliedRoute path="/login" exact component={Login} props={childProps}/>
        <AppliedRoute path="/new" component={NewEvent} props={childProps}/>
        <AppliedRoute path="/:id" component={Event} props={childProps} />
    </Switch>