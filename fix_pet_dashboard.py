import re

with open("src/pages/pet/Dashboard.tsx", "r") as f:
    content = f.read()

# Add imports for searchParams and useParams
content = content.replace("import { Navigate } from 'react-router';", "import { Navigate, useParams, useSearchParams, Link } from 'react-router';")

# Update Dashboard signature
content = content.replace(
    "export function Dashboard() {",
    "export function Dashboard({ isShared = false }: { isShared?: boolean }) {"
)

# Update logic inside Dashboard
dashboard_logic = """    const { user, userCourse, isAdmin } = useAuth();
    const { userId: paramUserId } = useParams();
    const [searchParams] = useSearchParams();
    
    let targetUserId = isShared ? paramUserId : (isAdmin && searchParams.get('userId')) ? searchParams.get('userId') : user?.uid;
    
    if (!isShared && !isAdmin && userCourse?.toLowerCase() !== 'pet') {
        return <Navigate to="/ielts/dashboard" replace />;
    }"""

content = content.replace("""    const { user, userCourse, isAdmin } = useAuth();
    
    if (!isAdmin && userCourse?.toLowerCase() !== 'pet') {
        return <Navigate to="/dashboard" replace />;
    }""", dashboard_logic)

with open("src/pages/pet/Dashboard.tsx", "w") as f:
    f.write(content)
