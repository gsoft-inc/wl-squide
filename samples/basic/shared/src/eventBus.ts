import { useEventBusDispatcher, useEventBusListener } from "@squide/firefly";

export type MessageTypes = "write-to-host";

export const useApplicationEventBusDispatcher = useEventBusDispatcher<MessageTypes>;
export const useApplicationEventBusListener = useEventBusListener<MessageTypes>;
