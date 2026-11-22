export async function signOutAndNavigate(signOut, navigate, onFailure) {
  try {
    await signOut();
  } catch (error) {
    onFailure(error);
  } finally {
    navigate();
  }
}
