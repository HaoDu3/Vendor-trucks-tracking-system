# Food Truck Tracking App

A comprehensive and real-time web application to track food truck locations using geo-tagged tweets from the Twitter API and WebSockets. This project involves frontend development with Next.js and React.js, backend development with Node.js, and deployment on AWS using Terraform and AWS Amplify.

## Description

The Food Truck Tracking App is designed to provide real-time locations of food trucks using geo-tagged tweets from Twitter. The application allows users to view the current locations of various food trucks on an interactive map. The backend leverages WebSockets to ensure that the location data is updated in real-time, providing an up-to-date experience for users.

## Features

- **Real-time Updates**: Uses WebSockets to provide real-time updates of food truck locations.
- **Interactive Map**: Integrates the Google Maps API with React.js to display food truck locations on an interactive map.
- **Geo-tagged Tweets**: Utilizes geo-tagged tweets from the Twitter API to get the real-time locations of food trucks.
- **Server-Side Rendering**: Uses Next.js for efficient server-side rendering.
- **Scalable Infrastructure**: Deploys the backend on AWS using a variety of services such as Lambda, API Gateway, DynamoDB, SQS, and ECS.
- **CI/CD Pipelines**: Implements CI/CD pipelines with GitHub Actions for automated building and deployment.
- **Containerization**: Uses Docker to containerize the application for consistent and reproducible deployments.

## Technologies Used

- **Frontend**: 
  - Next.js
  - React.js
  - Google Maps API

- **Backend**: 
  - Node.js
  - WebSockets
  - Twitter API

- **Cloud**: 
  - AWS Lambda
  - AWS API Gateway
  - DynamoDB
  - SQS
  - ECS
  - AWS Amplify
  - Terraform

- **DevOps**: 
  - GitHub Actions
  - Docker

## Installation

### Prerequisites

- Node.js
- AWS account
- Terraform
- Docker

### Backend

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/food-truck-tracking-app.git
    ```
2. Navigate to the backend directory:
    ```bash
    cd food-truck-tracking-app/backend
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Set up environment variables:
    Create a `.env` file in the backend directory and add your environment variables:
    ```env
    PORT=5000
    TWITTER_API_KEY=your_twitter_api_key
    AWS_ACCESS_KEY_ID=your_aws_access_key
    AWS_SECRET_ACCESS_KEY=your_aws_secret_key
    GOOGLE_API_KEY=your_google_api_key
    ```

5. Start the backend server:
    ```bash
    npm start
    ```

### Frontend

1. Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the frontend development server:
    ```bash
    npm run dev
    ```

### Infrastructure

1. Navigate to the infrastructure directory:
    ```bash
    cd ../infrastructure
    ```
2. Initialize Terraform:
    ```bash
    terraform init
    ```
3. Apply Terraform configuration:
    ```bash
    terraform apply
    ```

## Usage

1. Access the application at `http://localhost:3000`.
2. Register or log in to start using the features of the application.
3. View real-time food truck locations on the interactive map, sourced from geo-tagged tweets.

## API Endpoints

### User Endpoints

- `POST /api/users/register`
  - Description: Register a new user
  - Request Body:
    ```json
    {
      "username": "johndoe",
      "email": "johndoe@example.com",
      "password": "password123"
    }
    ```
  - Response:
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "id": "userId",
        "username": "johndoe",
        "email": "johndoe@example.com"
      }
    }
    ```

- `POST /api/users/login`
  - Description: Log in a user
  - Request Body:
    ```json
    {
      "email": "johndoe@example.com",
      "password": "password123"
    }
    ```
  - Response:
    ```json
    {
      "message": "Logged in successfully",
      "token": "jwt-token"
    }
    ```

### Food Truck Endpoints

- `GET /api/foodtrucks`
  - Description: Get all food truck locations
  - Response:
    ```json
    [
      {
        "id": "foodTruckId",
        "name": "Awesome Food Truck",
        "location": {
          "latitude": 34.0522,
          "longitude": -118.2437
        },
        "status": "active"
      }
    ]
    ```

## Contributing

1. Fork the project.
2. Create your feature branch:
    ```bash
    git checkout -b feature/AmazingFeature
    ```
3. Commit your changes:
    ```bash
    git commit -m 'Add some AmazingFeature'
    ```
4. Push to the branch:
    ```bash
    git push origin feature/AmazingFeature
    ```
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [your-email@example.com](mailto:your-email@example.com)

Project Link: [https://github.com/yourusername/food-truck-tracking-app](https://github.com/yourusername/food-truck-tracking-app)
