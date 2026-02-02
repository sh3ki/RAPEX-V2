from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .services import AuthService


class UserViewSet(viewsets.ModelViewSet):
    """
    User management viewset.
    Thin views - business logic delegated to AuthService.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """
        Login endpoint.
        Authenticates user and returns JWT tokens.
        """
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = AuthService.authenticate_user(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """
        Register endpoint.
        Creates a new user with the specified role.
        """
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = AuthService.register_user(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                role=serializer.validated_data.get('role', User.Role.USER),
                first_name=serializer.validated_data.get('first_name', ''),
                last_name=serializer.validated_data.get('last_name', ''),
                phone=serializer.validated_data.get('phone', ''),
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user profile."""
        return Response(UserSerializer(request.user).data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """Logout endpoint (stateless JWT - just remove token client-side)."""
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
