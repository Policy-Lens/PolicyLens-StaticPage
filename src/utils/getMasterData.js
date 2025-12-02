import { apiRequest } from "./api"

/**
 * Fetch list of countries from ISO3166 database
 * @param {string} searchText - Search query for country name
 * @param {number} pageSize - Number of results to return (default: all)
 * @returns {Promise<Array>} Array of country objects
 */
const getCountryList = async (searchText = "", pageSize = "all") => {
    try {
        let url = "/api/policylens/iso3166/";
        const params = new URLSearchParams();
        
        if (searchText) {
            params.append("search", searchText);
        }
        params.append("page_size", pageSize);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await apiRequest("GET", url, null, true);
        
        // Handle different response structures
        if (Array.isArray(response.data)) {
            return response.data;
        } else if (response.data?.results) {
            return response.data.results;
        } else if (Array.isArray(response.data?.data)) {
            return response.data.data;
        }
        
        return [];
    } catch (error) {
        console.error("Error fetching country list:", error);
        return [];
    }
};

/**
 * Fetch list of currencies from ISO4217 database
 * @param {string} searchText - Search query for currency name or code
 * @param {number} pageSize - Number of results to return (default: all)
 * @returns {Promise<Array>} Array of currency objects
 */
const getCurrencyList = async (searchText = "", pageSize = "all") => {
    try {
        let url = "/api/policylens/iso4217/";
        const params = new URLSearchParams();
        
        if (searchText) {
            params.append("search", searchText);
        }
        params.append("page_size", pageSize);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await apiRequest("GET", url, null, true);
        
        // Handle different response structures
        if (Array.isArray(response.data)) {
            return response.data;
        } else if (response.data?.results) {
            return response.data.results;
        } else if (Array.isArray(response.data?.data)) {
            return response.data.data;
        }
        
        return [];
    } catch (error) {
        console.error("Error fetching currency list:", error);
        return [];
    }
};

/**
 * Get country options formatted for Select dropdown
 * @param {string} searchText - Search query
 * @returns {Promise<Array>} Array of {label, value} objects
 */
const getCountryOptions = async (searchText = "") => {
    const countries = await getCountryList(searchText);
    return countries.map(country => ({
        label: `${country.country} (${country.alpha3_code})`,
        value: country.country,
        alpha2: country.alpha2_code,
        alpha3: country.alpha3_code
    }));
};

/**
 * Get currency options formatted for Select dropdown
 * @param {string} searchText - Search query
 * @returns {Promise<Array>} Array of {label, value} objects
 */
const getCurrencyOptions = async (searchText = "") => {
    const currencies = await getCurrencyList(searchText);
    return currencies.map(currency => ({
        label: `${currency.currency} (${currency.alphabetic_code})`,
        value: currency.alphabetic_code,
        code: currency.alphabetic_code,
        numericCode: currency.numeric_code
    }));
};

export {
    getCountryList,
    getCurrencyList,
    getCountryOptions,
    getCurrencyOptions
};
