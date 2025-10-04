import { Fragment, useState } from "react";
import HeaderTop from "./HeaderTop";
import HeaderMenu from "./HeaderMenu";

const Header = () => {
    return (
        <Fragment>
            <header className="header">
                {/* Parte superior: logo, contacto, mobile toggle */}
                <HeaderTop />

                {/* Menú principal y sticky */}
                <HeaderMenu />
            </header>
        </Fragment>
    );
};

export default Header;
