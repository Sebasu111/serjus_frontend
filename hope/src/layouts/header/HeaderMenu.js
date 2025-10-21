import React, { useState, useEffect } from "react";

const HeaderMenu = () => {
    const [scroll, setScroll] = useState(0);
    const [headerTop, setHeaderTop] = useState(0);

    useEffect(() => {
        const header = document.querySelector(".sticky-header");
        if (header) setHeaderTop(header.offsetTop);
        const handleScroll = () => setScroll(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div>
            {/* Keep the header structure but do NOT render the sidebar here.
                The global sidebar is rendered by `Layout` to avoid duplication. */}
            <div className="header-bottom d-none d-lg-block">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center">
                        {/* Intentionally left blank to avoid duplicate sidebar */}
                    </div>
                </div>
            </div>

            <div className={`header-bottom sticky-header d-none d-lg-block ${scroll > headerTop ? "sticky" : ""}`}>
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center">
                        {/* Intentionally left blank to avoid duplicate sidebar */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderMenu;
