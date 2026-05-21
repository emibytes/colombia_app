<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\Factory as SocialiteFactory;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class SocialAuthTest extends TestCase
{
    use RefreshDatabase;

    private function mockSocialiteUser(string $id, string $email, string $name): void
    {
        $abstractUser = Mockery::mock(SocialiteUser::class);
        $abstractUser->shouldReceive('getId')->andReturn($id);
        $abstractUser->shouldReceive('getEmail')->andReturn($email);
        $abstractUser->shouldReceive('getName')->andReturn($name);

        $provider = Mockery::mock(\Laravel\Socialite\Two\GoogleProvider::class);
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('user')->andReturn($abstractUser);

        $socialite = Mockery::mock(SocialiteFactory::class);
        $socialite->shouldReceive('driver')->andReturn($provider);

        $this->app->instance(SocialiteFactory::class, $socialite);
    }

    public function test_callback_creates_new_user_and_redirects_with_token(): void
    {
        $this->mockSocialiteUser('google-uid-1', 'new@example.com', 'New User');

        $response = $this->get('/api/auth/google/callback');

        $response->assertRedirectContains('/auth/callback?token=');
        $response->assertRedirectContains('needs_consent=1');

        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
    }

    public function test_callback_links_existing_email_user(): void
    {
        $user = User::factory()->create(['email' => 'existing@example.com']);

        $this->mockSocialiteUser('google-uid-2', 'existing@example.com', 'Existing');

        $response = $this->get('/api/auth/google/callback');

        $response->assertRedirectContains('/auth/callback?token=');
        $response->assertRedirectContains('needs_consent=0');

        $this->assertDatabaseHas('users', [
            'email'     => 'existing@example.com',
            'google_id' => 'google-uid-2',
        ]);
    }

    public function test_callback_returns_error_for_unsupported_provider(): void
    {
        $response = $this->getJson('/api/auth/twitter/callback');

        $response->assertStatus(422);
    }

    public function test_redirect_returns_422_for_unsupported_provider(): void
    {
        $response = $this->getJson('/api/auth/twitter/redirect');

        $response->assertStatus(422);
    }
}
