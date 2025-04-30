import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <input
            type="text"
            placeholder="Search by Doctor, Specialty, Date, or Time"
            className="w-full p-2 mb-4 border rounded"
            value={searchTerm}
            onChange={handleSearch}
        />
    );
};

export default SearchBar;
