interface ILatLng {
	lat?: number;
	lng?: number;
}

export interface IGooglePay {
	amount: string;
	timestamp: string;
	status: string;
	direction: "s" | "r";
	location: ILatLng
}
