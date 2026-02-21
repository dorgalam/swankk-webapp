import React from 'react';
import ContentEditor from './pages/ContentEditor';
import DesignerWorld from './pages/DesignerWorld';
import EraGallery from './pages/EraGallery';
import Home from './pages/Home';
import ImageDetail from './pages/ImageDetail';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Saved from './pages/Saved';
import SharedCollection from './pages/SharedCollection';
import TagDiscovery from './pages/TagDiscovery';
import TrendDetail from './pages/TrendDetail';
import TrendImageDetail from './pages/TrendImageDetail';
import __Layout from './Layout';


export const PAGES: Record<string, React.ComponentType> = {
    "ContentEditor": ContentEditor,
    "DesignerWorld": DesignerWorld,
    "EraGallery": EraGallery,
    "Home": Home,
    "ImageDetail": ImageDetail,
    "Landing": Landing,
    "Login": Login,
    "Profile": Profile,
    "Saved": Saved,
    "SharedCollection": SharedCollection,
    "TagDiscovery": TagDiscovery,
    "TrendDetail": TrendDetail,
    "TrendImageDetail": TrendImageDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
