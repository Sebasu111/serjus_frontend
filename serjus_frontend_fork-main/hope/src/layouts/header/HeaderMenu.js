import React, { useState, useEffect } from "react";
import MainMenu from "../../components/menu/main-menu";

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
            <div className="header-bottom d-none d-lg-block">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center">
                        <MainMenu />
                    </div>
                </div>
            </div>

            <div
                className={`header-bottom sticky-header d-none d-lg-block ${
                    scroll > headerTop ? "sticky" : ""
                }`}
            >
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center">
                        <MainMenu />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderMenu;
