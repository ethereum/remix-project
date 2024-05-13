import { ModalTypes } from "@remix-ui/app"
import { StatusEvents } from "@remixproject/plugin-utils"

export interface INotificationApi {
  events: {

  } & StatusEvents,
  methods: {
    toast(key: string): Promise<void>,
    alert({
      title,
      message
    }:{
      title: string,
      message: string,
    }): Promise<void>,
    modal({
      title,
      message,
      okLabel,
      type
    }:{
      title: string,
      message: string,
      okLabel: string,
      type: ModalTypes
    }): Promise<void>,
  }
}