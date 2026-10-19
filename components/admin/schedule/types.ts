export interface BookingInfo {
  bookedBy: string;
  memo: string;
}

export interface BookingModalState {
  date: string;
  time: string;
  endTime: string;
  mode: "book" | "view";
  existing?: BookingInfo;
}
