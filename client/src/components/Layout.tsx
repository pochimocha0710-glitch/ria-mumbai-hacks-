import { motion } from "framer-motion";
import { ReactNode } from "react";
import UnifiedHeader from "./UnifiedHeader";

interface LayoutProps {
    children: ReactNode;
    showHeader?: boolean;
}

export default function Layout({ children, showHeader = true }: LayoutProps) {
    return (
        <div className="min-h-screen">
            {showHeader && <UnifiedHeader />}
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.main>
        </div>
    );
}
