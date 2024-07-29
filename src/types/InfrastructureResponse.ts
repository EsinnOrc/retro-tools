import { City } from './City';
import { District } from './District';

interface InfrastructureResponse {
    cities: {
      returnCode: number;
      returnMessage: string;
      content: City[];
      status: number;
      timestamp: string;
    }[];
    districts: {
      cityId: string;
      returnCode: number;
      returnMessage: string;
      content: District[];
      status: number;
      timestamp: string;
    }[];
    neighborhoods: {
      districtId: string;
      returnCode: number;
      returnMessage: string;
      content: {
        basarSoftQuarterList: Neighborhood[];
      };
    }[];
    streets: {
      neighborhoodId: number;
      returnCode: number;
      returnMessage: string;
      content: {
        basarSoftAvenueStreetList: Street[];
      };
    }[];
    buildingDoors: {
      streetsId: string;
      returnCode: number;
      returnMessage: string;
      content: {
        basarSoftBuildingDoorList: BuildingDoor[];
      };
    }[];
    doors: {
      buildingId: string;
      content: Door[];
    }[];
  }