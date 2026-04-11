import React from 'react';
import AllColors from './pages/AllColors';
import AllDesigners from './pages/AllDesigners';
import AllEras from './pages/AllEras';
import AllStyles from './pages/AllStyles';
import AllTrends from './pages/AllTrends';
import Shop from './pages/Shop';
import ColorDetail from './pages/ColorDetail';
import ContentEditor from './pages/ContentEditor';
import DesignerWorld from './pages/DesignerWorld';
import EraGallery from './pages/EraGallery';
import Home from './pages/Home';
import IconicProduct from './pages/IconicProduct';
import ImageDetail from './pages/ImageDetail';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Saved from './pages/Saved';
import SharedCollection from './pages/SharedCollection';
import TagDiscovery from './pages/TagDiscovery';
import TermsAndConditions from './pages/TermsAndConditions';
import TrendDetail from './pages/TrendDetail';
import TrendImageDetail from './pages/TrendImageDetail';
import __Layout from './Layout';


export const PAGES: Record<string, React.ComponentType> = {
    "AllColors": AllColors,
    "AllDesigners": AllDesigners,
    "AllEras": AllEras,
    "AllStyles": AllStyles,
    "AllTrends": AllTrends,
    "Shop": Shop,
    "ColorDetail": ColorDetail,
    "ContentEditor": ContentEditor,
    "DesignerWorld": DesignerWorld,
    "EraGallery": EraGallery,
    "Home": Home,
    "IconicProduct": IconicProduct,
    "ImageDetail": ImageDetail,
    "Landing": Landing,
    "Login": Login,
    "Profile": Profile,
    "Saved": Saved,
    "SharedCollection": SharedCollection,
    "TagDiscovery": TagDiscovery,
    "terms": TermsAndConditions,
    "TrendDetail": TrendDetail,
    "TrendImageDetail": TrendImageDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
