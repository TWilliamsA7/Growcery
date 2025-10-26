export interface GeminiResponse {
  user_type: "consumer" | "farmer";
  expiration_date: string;
  harvest_date: string;
  produce_name: string;
  crop_name: string;
  storage_method: string;
  health: string;
  attributes: string;
  physical_qualities: string;
  treatment: string;
  location: string;
  disease: string;
}
