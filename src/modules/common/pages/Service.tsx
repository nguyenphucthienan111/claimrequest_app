import React from 'react';
import Layout from '../../../shared/layouts/Layout';
import Footer from '../../../shared/components/layoutComponent/Footer';
import DescriptionIcon from '@mui/icons-material/Description';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GroupIcon from '@mui/icons-material/Group';
import './Service.css';

const ServicePage: React.FC = () => {
  return (
    <Layout>
      <div className='service-page'>
        <div className='service-header'>
          <div className='service-title'>
            <h1>Affordable Claiming Services Tailored For You</h1>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita neque illo rem asperiores quas doloribus, consequuntur laborum optio dolor dolorum vel, ut minima obcaecati odio. Consectetur unde iusto consequuntur inventore!</p>
          </div>
          <div className='service-float-container'>
            <div className='service-items'>
              <DescriptionIcon sx={{ fontSize: "4em" }} />
              <h3>Claim Request Management</h3>
              <p>Create, track, and manage reimbursement requests efficiently.</p>
            </div>
            <div className='service-items'>
              <TaskAltIcon sx={{ fontSize: "4em" }} />
              <h3>Approval Workflow</h3>
              <p>Streamline approval processes with real-time status updates.</p>
            </div>
            <div className='service-items'>
              <MonetizationOnIcon sx={{ fontSize: "4em" }} />
              <h3>Finance Processing</h3>
              <p>Ensure seamless financial processing for approved claims.</p>
            </div>
            <div className='service-items'>
              <GroupIcon sx={{ fontSize: "4em" }} />
              <h3>User & Project Management</h3>
              <p>Manage users, roles, and project access effortlessly.</p>
            </div>
          </div>
        </div>
        <div className='service-intro'>
          <h2>What We Do</h2>
          <div>
            <div>
              <h3>CLAIM PROCESSING</h3>
              <ul>
                <li>Create and submit claim requests</li>
                <li>Attach supporting documents</li>
                <li>Track claim request status</li>
                <li>View claim request history</li>
              </ul>
            </div>
            <div>
              <h3>APPROVAL WORKFLOW</h3>
              <ul>
                <li>Review and approve/reject claims</li>
                <li>Add comments and feedback</li>
                <li>Automatic notifications for pending approvals</li>
                <li>Multi-level approval process</li>
              </ul>
            </div>
            <div>
              <h3>FINANCE HANDLING</h3>
              <ul>
                <li>Process approved claims for payment</li>
                <li>Generate financial reports</li>
                <li>Track payment status</li>
                <li>Ensure compliance with company policies</li>
              </ul>
            </div>
            <div>
              <h3>USER & PROJECT MANAGEMENT</h3>
              <ul>
                <li>Manage user accounts and roles</li>
                <li>Assign approvers and finance handlers</li>
                <li>Monitor claim activities per project</li>
                <li>Control access and permissions</li>
              </ul>
            </div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default ServicePage;