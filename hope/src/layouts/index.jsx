import React, { Fragment } from "react";
import PropTypes from "prop-types";
import SidebarMenu from "../components/menu/main-menu";

const Layout = ({ children }) => {
    // Render the global SidebarMenu as a sibling so the existing
    // `.main-content` CSS rules (which use sibling selectors) apply.
    return (
        <Fragment>
            <SidebarMenu />
            {children}
        </Fragment>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired
};

export default Layout;
