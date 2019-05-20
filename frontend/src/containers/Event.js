import React, { Component } from "react";
import { API } from "aws-amplify";

export default class Event extends Component {
    constructor(props) {
        super(props);
        this.state = {
            event: null,
            content: "",
        };
    }

    async componentDidMount() {
        try {
            const event = await this.getEvent();
            const { content } = event;

            this.setState({
                event,
                content,
            });
        } catch (e) {
            alert(e);
        }
    }

    getEvent() {
        return API.get("Easyplanner", `/event?q=${this.props.match.params.id}`);
    }

    render() {
        return <div className="Events"></div>;
    }
}
