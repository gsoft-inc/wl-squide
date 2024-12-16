import { useEventBusDispatcher, useEventBusListener } from "@squide/firefly";

export type MessageTypes = "write-to-host" | "show-toast";

export const useApplicationEventBusDispatcher = useEventBusDispatcher<MessageTypes>;
export const useApplicationEventBusListener = useEventBusListener<MessageTypes>;
