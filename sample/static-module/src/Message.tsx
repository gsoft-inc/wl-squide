import { ChangeEvent, useCallback, useState } from "react";

import { Link } from "react-router-dom";
import { useApplicationEventBusDispatcher } from "@sample/shared";

export default function Message() {
    const [message, setMessage] = useState("");

    const handleTextChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value);
    }, []);

    const dispatch = useApplicationEventBusDispatcher();

    const handleSendMessage = useCallback(() => {
        dispatch("write-to-host", message);
        setMessage("");
    }, [message]);

    return (
        <div>
            <h2>Messaging</h2>
            <p>Send a message to the host application:</p>
            <textarea value={message} onChange={handleTextChange} />
            <br />
            <button type="button" onClick={handleSendMessage}>Send</button>
            <p>Hint: have a look at your console log :)</p>
            <Link to="/">Go back to home</Link>
        </div>
    );
}
