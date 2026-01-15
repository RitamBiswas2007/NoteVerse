import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PageLoader } from "@/components/layout/PageLoader";
import { PageWrapper } from "@/components/layout/PageWrapper";

// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Notes = lazy(() => import("./pages/Notes"));
const PersonalNotes = lazy(() => import("./pages/PersonalNotes"));
const Circles = lazy(() => import("./pages/Circles"));
const Thoughts = lazy(() => import("./pages/Thoughts"));
const PeerNotes = lazy(() => import("./pages/PeerNotes"));
const Terms = lazy(() => import("./pages/Terms"));
const Settings = lazy(() => import("./pages/Settings"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Support = lazy(() => import("./pages/Support"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const Install = lazy(() => import("./pages/Install"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const Recall = lazy(() => import("./pages/Recall"));
const StudyMates = lazy(() => import("./pages/StudyMates"));
// const NoteDetail = lazy(() => import("./pages/NoteDetail"));
const NoteReader = lazy(() => import("./pages/NoteReader"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FocusMode = lazy(() => import("./pages/FocusMode"));
const KnowledgeGraph = lazy(() => import("./pages/KnowledgeGraph"));
const DirectMessages = lazy(() => import("./pages/DirectMessages"));

export const AppRoutes = () => {
    const location = useLocation();

    return (
        <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    {/* Public Routes */}
                    <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
                    <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
                    <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
                    <Route path="/faq" element={<PageWrapper><FAQ /></PageWrapper>} />
                    <Route path="/support" element={<PageWrapper><Support /></PageWrapper>} />
                    <Route path="/disclaimer" element={<PageWrapper><Disclaimer /></PageWrapper>} />
                    <Route path="/install" element={<PageWrapper><Install /></PageWrapper>} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
                        <Route path="/focus" element={<PageWrapper><FocusMode /></PageWrapper>} />
                        <Route path="/graph" element={<PageWrapper><KnowledgeGraph /></PageWrapper>} />
                        <Route path="/notes" element={<PageWrapper><Notes /></PageWrapper>} />
                        <Route path="/notes/:id" element={<PageWrapper><NoteReader /></PageWrapper>} />
                        <Route path="/your-notes" element={<PageWrapper><PersonalNotes /></PageWrapper>} />
                        <Route path="/circles" element={<PageWrapper><Circles /></PageWrapper>} />
                        <Route path="/thoughts" element={<PageWrapper><Thoughts /></PageWrapper>} />
                        <Route path="/peer-notes" element={<PageWrapper><PeerNotes /></PageWrapper>} />
                        <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
                        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
                        <Route path="/recall" element={<PageWrapper><Recall /></PageWrapper>} />
                        <Route path="/mates" element={<PageWrapper><StudyMates /></PageWrapper>} />
                        <Route path="/messages" element={<PageWrapper><DirectMessages /></PageWrapper>} />
                    </Route>

                    {/* Catch-all */}
                    <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
                </Routes>
            </AnimatePresence>
        </Suspense>
    );
};
