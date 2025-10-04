import React, { useEffect, useState, Fragment } from "react";
import Logo from "../../components/logo";
import HeaderContactInfo from "../../components/header-contact-info";
import HomeData from "../../data/home.json";
import MobileMenu from "../../components/menu/mobile-menu";
import MenuOverlay from "../../components/menu/menu-overlay";

const HeaderTop = () => {
    const [ofcanvasShow, setOffcanvasShow] = useState(false);
    const onCanvasHandler = () => setOffcanvasShow(prev => !prev);

    return (
        <Fragment>
            <div className="header-top">
                <div className="container">
                    <div className="header-middle-content d-flex justify-content-between align-items-center">
                        <div className="header-logo">
                            <Logo image={`${process.env.PUBLIC_URL}/img/logo.png`} />
                        </div>

                        <ul className="media-wrap d-none d-lg-flex">
                            {HomeData[0].headerInfo &&
                                HomeData[0].headerInfo.map((single, key) => (
                                    <HeaderContactInfo key={key} data={single} />
                                ))}
                        </ul>

                        <div className="mobile-menu-toggle d-lg-none">
                            <button onClick={onCanvasHandler} className="offcanvas-toggle">
                                {/* SVG del botón */}
                            </button>
                        </div>
                    </div>
                </div>

                <MenuOverlay show={ofcanvasShow} />
                <MobileMenu show={ofcanvasShow} onClose={onCanvasHandler} />
            </div>
        </Fragment>
    );
};

export default HeaderTop;
