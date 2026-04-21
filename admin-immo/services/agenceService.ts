import { API_BASE_URL } from "@/services/api";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `${API_BASE_URL}`;

export async function getAgences() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/agences`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching agences:', error);
    return [];
  }
}
