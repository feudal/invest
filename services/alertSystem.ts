import axios from "axios";
import dotenv from "dotenv";
import process from "node:process";

dotenv.config();

export const sendSMS = async (msg: string) => {
  try {
    const response = await axios.post(
      "https://api.voodoosms.com/sendsms",
      {
        to: process.env.MY_NUMBER,
        from: "VoodooSMS",
        msg,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SMS_API}`,
        },
      },
    );

    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};
