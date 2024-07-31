import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { View, Alert } from "react-native";
import { Button, Input } from "@rneui/themed";
import { useSession } from "@/context/ctx";
import Avatar from "@/components/Avatar";

export default function Account() {
  const [loading, setLoading] = useState(true);
  const [name, setUsername] = useState("");
  const [avatar, setAvatarUrl] = useState("");
  const { session } = useSession();

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("users")
        .select(`name, avatar`)
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.name);
        setAvatarUrl(data.avatar);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    name,
    avatar,
  }: {
    name: string;
    avatar: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        name,
        avatar,
        // timestamp with time zone
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("users").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
      Alert.alert("Profile updated successfully!");
    }
  }

  return (
    <View className="flex-1 mt-10 px-5">
      <View className="flex self-center">
        <Avatar
          size={100}
          url={avatar}
          onUpload={(url: string) => {
            setAvatarUrl(url);
            updateProfile({ name, avatar: url });
          }}
        />
      </View>
      <View className="py-4">
        <Input
          label="Nombre"
          value={name || ""}
          onChangeText={(text) => setUsername(text)}
        />
      </View>
      <View className="py-4 self-center">
        <Button
          title={loading ? "Loading ..." : "Update"}
          onPress={() => updateProfile({ name, avatar: avatar })}
          disabled={loading}
        />
      </View>

      <View className="py-4 self-center">
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  );
}
